export const getHealth = (req, res) => {
    res.status(200).json({
        status: 'online',
        service: 'ForenseID API',
        step: 3,
        architecture: 'Controller-Router Pattern',
        timestamp: new Date().toISOString()
    });
};
//# sourceMappingURL=health.controller.js.map