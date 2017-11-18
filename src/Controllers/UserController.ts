import {Router, Request, Response} from 'express';

export class UserController {

    public static route: string = 'login';
    public router: Router = Router();

    public sayHello(req: Request, res: Response) {
        res.send('Hello-World');
    }
}