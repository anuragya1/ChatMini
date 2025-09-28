import * as authService from "../services/AuthServices.js";

export const register = async (req, res, next) => {
  try {
    const data = await authService.registerUser(req.body);
    res.status(201).json(data);
  } catch (e) { next(e); }
};

export const login = async (req, res, next) => {
  try {
    const userData = await authService.loginUser(req.body);
    res.json({ userData });
  } catch (e) { next(e); }
};
