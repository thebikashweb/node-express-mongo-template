import express, { NextFunction, Request, Response } from "express";
import { createUserController } from "../controller/userController";

const router = express.Router();

router.post("/", createUserController);

export default router;
