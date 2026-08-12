import * as authService from "../services/auth.service.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña son obligatorios",
      });
    }

    const result = await authService.login({ email: email.trim(), password });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.userId);

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
