'use strict';

import async from 'async';
import request from 'request';
import express from 'express';
import { Response, Request, NextFunction } from 'express';


/**
 * GET /api
 * List of API examples.
 */
export let getApi = (req: Request, res: Response) => {
  res.send({
    message: 'There is nothing here'
  });
};
