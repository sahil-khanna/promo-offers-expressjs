import {Router, Request, Response} from 'express';

export class UserController {

    public sayHello(req: Request, res: Response) {
        res.send('Hello-World11123');
    }
}