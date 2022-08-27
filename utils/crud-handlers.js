const { Op } = require("sequelize");

exports.createHandler =
  (
    Model,
    message = "Data created successfully",
    cb = async (req) => req.body
  ) =>
  async (req, res, next) => {
    try {
      let body = {};
      if (cb.toString().includes("async")) {
        body = await cb(req, next);
      } else {
        body = cb(req);
      }

      const data = await Model.create(body);

      res.status(201).json({
        code: 201,
        message,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

exports.getAllHandler =
  (Model, message = "Success", searchColumns = []) =>
  async (req, res, next) => {
    try {
      let options = {};

      const search = req.query.search;
      if (search) {
        options["where"] = {
          [Op.or]: searchColumns.map((col) => ({
            [col]: {
              [Op.like]: `%${search}%`,
            },
          })),
        };
      }

      if (req.query.page && req.query.perPage) {
        const page = parseInt(req.query.page);
        const perPage = parseInt(req.query.perPage);
        const offset = (page - 1) * perPage;
        options = {
          limit: perPage,
          offset,
        };
        const { count, rows } = await Model.findAndCountAll(options);
        return res.json({
          code: 200,
          message,
          data: rows,
          total: count,
          page,
          perPage,
          pageCount: Math.ceil(count / perPage),
        });
      } else {
        const data = await Model.findAll(options);
        return res.json({
          code: 200,
          message,
          data,
        });
      }
    } catch (err) {
      next(err);
    }
  };

exports.getById =
  (Model, message = "Data not found!") =>
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const data = await Model.findOne({
        where: {
          id,
        },
      });

      if (!data) {
        return res.status(404).json({
          code: 404,
          message,
        });
      }

      res.data = data;
      next();
    } catch (err) {
      next(err);
    }
  };

exports.updateHandler =
  (
    Model,
    message = "Data updated successfully",
    cb = async (req) => req.body
  ) =>
  async (req, res, next) => {
    try {
      const { id } = req.params;
      let body = {};
      if (cb.toString().includes("async")) {
        body = await cb(req, next);
      } else {
        body = cb(req);
      }
      const data = await Model.update(body, {
        where: {
          id,
        },
      });

      res.json({
        code: 200,
        message,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

exports.deleteHandler =
  (Model, message = "Data deleted successfully") =>
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await Model.destroy({
        where: {
          id,
        },
      });

      res.json({
        code: 204,
        message,
      });
    } catch (err) {
      next(err);
    }
  };
