import type { Request, Response } from 'express';

export const getHealth = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    service: 'ForenseID API',
    step: 3,
    architecture: 'Controller-Router Pattern',
    timestamp: new Date().toISOString()
  });
};