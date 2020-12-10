/** Routes for companies */

const db = require("../db");
const express = require("express");
const router = express.Router();

/** Get companies: [{code, name}, {code, name}, {code, name}] */

router.get("/", async function (req, res, next) {
  try {
    const results = await db.query(`SELECT code, name FROM companies`);

    return res.json(results.rows);
  } catch (err) {
    return next(err);
  }
});

// Search by company code. */

router.get("/:code", async function (req, res, next) {
  try {
    const code = req.params.code;

    const compResult = await db.query(
      `SELECT code, name, description,
       FROM companies
       WHERE code=$1`,
      [code]
    );

    const invResult = await db.query(
      `SELECT id
           FROM invoices
           WHERE comp_code = $1`,
      [code]
    );

    if (compResult.rows.length === 0) {
      let notFoundError = new Error(`There is no company with code '${code}`);
      notFoundError.status = 404;
      throw notFoundError;
    }

    const company = compResult.rows[0];
    const invoices = invResult.rows;

    company.invoices = invoices.map((inv) => inv.id);

    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** Create new company, return company */

router.post("/", async function (req, res, next) {
  try {
    const { code, name, description } = req.body;

    const result = await db.query(
      `INSERT INTO companies (code, name, description) 
           VALUES ($1, $2, $3)
           RETURNING code, name, description`,
      [code, name, description]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

/** Update company, returning company */

router.put("/:code", async function (req, res, next) {
  try {
    const { name, description } = req.body;

    const result = await db.query(
      `UPDATE companies SET name=$1, type=$2
           WHERE code = $3
           RETURNING code, name, description`,
      [name, description, req.params.code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(
        `There is no company with code of '${req.params.code}`,
        404
      );
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

/** Delete company, returning {status: "deleted"} */

router.delete("/:code", async function (req, res, next) {
  try {
    const result = await db.query("DELETE FROM companies WHERE code = $1", [
      req.params.code,
    ]);

    if (result.rows.length === 0) {
      throw new ExpressError(
        `There is no company with code of '${req.params.code}`,
        404
      );
    }

    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});
// end

module.exports = router;
