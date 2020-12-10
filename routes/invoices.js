/** Routes for invoice */

const db = require("../db");
const express = require("express");
const router = express.Router();

/** Get invoices: [{id, comp_code}, {id, comp_code}, {id, comp_code}] */

router.get("/", async function (req, res, next) {
  try {
    const results = await db.query(
      `SELECT id, comp_code 
       FROM invoices
       ORDER BY id`
    );

    return res.json(results.rows);
  } catch (err) {
    return next(err);
  }
});

// Search by invoice id. */

router.get("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;

    const results = await db.query(
      `SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description 
       FROM invoices AS i
       INNER JOIN companies AS c ON (i.comp_code = c.code)
       WHERE id=$1`,
      [id]
    );

    if (results.rows.length === 0) {
      let notFoundError = new Error(`There is no invoice with id '${id}`);
      notFoundError.status = 404;
      throw notFoundError;
    }

    const data = result.rows[0];
    const invoice = {
      id: data.id,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
    };

    return res.json({ invoice });
  } catch (err) {
    return next(err);
  }
});

/** Create new invoice, return invoice */

router.post("/", async function (req, res, next) {
  try {
    const { comp_code, amt } = req.body;

    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) 
           VALUES ($1, $2)
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** Update invoice, returning invoice */

router.put("/:id", async function (req, res, next) {
  try {
    const { amt } = req.body;
    const id = req.params.id;

    const result = await db.query(
      `INSERT INTO invoices (amt) 
           VALUES ($1)
           WHERE id=$2
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, id]
    );

    if (result.rows.length === 0) {
      let notFoundError = new Error(`There is no invoice with id '${id}`);
      notFoundError.status = 404;
      throw notFoundError;
    }

    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** Delete invoice, returning {status: "deleted"} */

router.delete("/:id", async function (req, res, next) {
  try {
    const result = await db.query("DELETE FROM invoices WHERE id = $1", [
      req.params.id,
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
