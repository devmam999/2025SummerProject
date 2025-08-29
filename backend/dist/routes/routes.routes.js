"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const routes_controller_1 = require("../controllers/routes.controller");
const router = (0, express_1.Router)();
router.post('/suggestions', auth_1.authenticate, routes_controller_1.getRouteSuggestions);
router.post('/refine', auth_1.authenticate, routes_controller_1.refineRoute);
exports.default = router;
