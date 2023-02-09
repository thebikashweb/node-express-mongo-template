import { Router } from "express";

import userRouter from "./userRouter";

const router = Router();

//all the router get prefix /api

router.use("/users", userRouter);

export default router;
