import {Router} from 'express';
import {createUser} from '../auth-controller';
import {checkIfAuthenticated} from '../auth-middleware';


const router = Router();


router.post('/auth/signup', createUser);

router.get('/articles', checkIfAuthenticated, async (_, res) => {
  return res.send('protected');
});  

export default router;
