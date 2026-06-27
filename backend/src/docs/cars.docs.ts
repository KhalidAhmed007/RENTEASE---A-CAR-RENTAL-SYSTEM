/**
 * @swagger
 * tags:
 *   name: Cars
 *   description: Car inventory management
 * 
 * /cars:
 *   get:
 *     summary: Retrieve a list of cars
 *     tags: [Cars]
 *     security: [] 
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [sedan, suv, luxury, electric]
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: A paginated list of cars
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     cars:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 */
export {};
