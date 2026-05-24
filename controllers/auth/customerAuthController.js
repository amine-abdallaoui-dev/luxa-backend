const bcrypt = require("bcrypt");
const customerModel = require("../../models/customerModel");
const { createToken } = require("../../utils/createtoken");
const { responseReturn } = require("../../utils/responseReturn");

class customerAuthController {
  register = async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
      const exists = await customerModel.findOne({ email });
      if (exists) {
        return responseReturn(res, 401, { error: "Email already exists" });
      }
      const customer = await customerModel.create({
        name,
        email,
        password: await bcrypt.hash(password, 10),
        phone: phone || "",
      });
      const token = await createToken({ id: customer._id, role: "customer" });
      res.cookie("customer_token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "none",
      });
      const safe = await customerModel.findById(customer._id).select("-password");
      responseReturn(res, 201, {
        customer: safe,
        token,
        message: "Registration successful",
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const customer = await customerModel
        .findOne({ email })
        .select("+password");
      if (!customer) {
        return responseReturn(res, 404, { error: "Email not found" });
      }
      const match = await bcrypt.compare(password, customer.password);
      if (!match) {
        return responseReturn(res, 404, { error: "Password wrong" });
      }
      const token = await createToken({ id: customer._id, role: "customer" });
      res.cookie("customer_token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "lax",
      });
      const safe = await customerModel.findById(customer._id).select("-password");
      responseReturn(res, 200, { customer: safe, token, message: "Login success" });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_customer = async (req, res) => {
    try {
      const customer = await customerModel.findById(req.id).select("-password");
      if (!customer) {
        return responseReturn(res, 404, { error: "Customer not found" });
      }
      responseReturn(res, 200, { customer });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  logout = async (req, res) => {
    res.clearCookie("customer_token");
    responseReturn(res, 200, { message: "Logged out" });
  };

  update_profile = async (req, res) => {
    const { name, phone, address, city } = req.body;
    try {
      const customer = await customerModel.findByIdAndUpdate(
        req.id,
        { name, phone, address, city },
        { new: true, runValidators: true }
      ).select("-password");
      if (!customer) return responseReturn(res, 404, { error: "Customer not found" });
      responseReturn(res, 200, { customer, message: "Profile updated" });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}

module.exports = new customerAuthController();
