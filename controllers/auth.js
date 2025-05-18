const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const multer = require("multer");
const mongoose = require("mongoose");
const crypto = require("crypto"); // Para gerar nomes de arquivo únicos
const path = require("path");
const fs = require("fs");

const User = require("../models/user");
const { getDecodedJWT } = require("../lib/is-auth");

// Configuração do armazenamento local para multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads");
        // Verifica se o diretório existe, se não, cria
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        crypto.randomBytes(16, (err, buf) => {
            if (err) {
                return cb(err);
            }
            const filename = buf.toString("hex") + path.extname(file.originalname);
            cb(null, filename);
        });
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
        cb(null, true);
    } else {
        cb(new Error("Formato de arquivo não suportado. Apenas JPEG, PNG e JPG são permitidos."), false);
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter, 
    limits: { fileSize: 1024 * 1024 * 5 } // Limite de 5MB
});

// Função auxiliar para deletar arquivos do sistema de arquivos local
const deleteLocalFile = async (filePath) => {
    if (!filePath) return;
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Arquivo ${filePath} deletado.`);
        }
    } catch (error) {
        console.error(`Erro ao deletar arquivo ${filePath}:`, error);
        // Não lançar erro aqui para não interromper o fluxo principal, mas logar
    }
};

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const msg = errors.array()?.[0]?.msg;
      const error = new Error(msg || "Validation failed! please enter valid input.");
      error.statusCode = 422;
      if (req.file) {
        await deleteLocalFile(req.file.path);
      }
      throw error;
    }

    const { email, password, name, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        const error = new Error("As senhas não coincidem.");
        error.statusCode = 422;
        if (req.file) {
            await deleteLocalFile(req.file.path);
        }
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashPwd = await bcrypt.hash(password, salt);

    let profilePicture = null;
    if (req.file) {
        profilePicture = req.file.filename; // Salva o nome do arquivo
    }

    const user = new User({
      name,
      email,
      password: hashPwd,
      profilePicture: profilePicture // Armazena o nome do arquivo
    });

    const newUser = await user.save();

    return res.status(201).json({
      message: "Conta criada com sucesso.",
      user: {
        name: newUser.name,
        email: newUser.email,
        profilePicture: newUser.profilePicture // Retorna o nome da imagem
      },
    });
  } catch (error) {
    if (req.file && error.statusCode !== 422) {
        await deleteLocalFile(req.file.path);
    }
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("Usuário não encontrado.");
      error.statusCode = 401;
      throw error;
    }
    const isAuthenticated = await bcrypt.compare(password, user.password);
    if (!isAuthenticated) {
      const error = new Error("Email ou Senha incorretos.");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      { email: user.email, userId: user._id.toString() },
      process.env.SECRET_KEY_JWT,
      { expiresIn: "1h" }
    );
    return res.status(200).json({
      token,
      userId: user._id.toString(),
      username: user.name,
      profilePicture: user.profilePicture // Retorna o nome da imagem
    });
  } catch (error) {
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    next(error);
  }
};

exports.isAuth = async (req, res, next) => {
  try {
    const authorization = req.get("Authorization");
    if (!authorization) {
      const error = new Error("Não autorizado");
      error.statusCode = 401;
      throw error;
    }
    const token = authorization?.split(" ")?.[1];
    if (!token) {
      const error = new Error("Não autorizado");
      error.statusCode = 401;
      throw error;
    }
    const decodedToken = getDecodedJWT(token);
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      const error = new Error("Não autorizado");
      error.statusCode = 401;
      throw error;
    }
    return res.status(200).json({
      decodedToken,
      username: user.name,
      profilePicture: user.profilePicture // Retorna o nome da imagem
    });
  } catch (error) {
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            const error = new Error("Nenhuma imagem selecionada.");
            error.statusCode = 422;
            throw error;
        }

        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user) {
            const error = new Error("Usuário não encontrado.");
            error.statusCode = 404;
            await deleteLocalFile(req.file.path);
            throw error;
        }

        // Se o usuário já tiver uma foto de perfil, remove a antiga
        if (user.profilePicture) {
            const oldPicturePath = path.join(__dirname, "../uploads", user.profilePicture);
            await deleteLocalFile(oldPicturePath);
        }

        user.profilePicture = req.file.filename; // Salva o nome do novo arquivo
        await user.save();

        res.status(200).json({ 
            message: "Foto de perfil atualizada com sucesso!", 
            profilePicture: user.profilePicture // Retorna o nome da nova imagem
        });

    } catch (error) {
        if (req.file && error.statusCode !== 422 && error.statusCode !== 404) { 
            await deleteLocalFile(req.file.path);
        }
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

// Middleware de upload para ser usado nas rotas
exports.uploadMiddleware = upload.single("profilePicture");

// Nova rota para servir imagens do sistema de arquivos local
exports.getProfilePicture = async (req, res, next) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, "../uploads", filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "Imagem não encontrada." });
        }
        
        res.sendFile(filePath);
    } catch (error) {
        console.error("Erro na rota getProfilePicture:", error);
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};
