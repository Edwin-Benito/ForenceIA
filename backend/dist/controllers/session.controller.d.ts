import type { Request, Response } from 'express';
export declare const createSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSessions: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=session.controller.d.ts.map