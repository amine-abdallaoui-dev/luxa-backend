const buildListQuery = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(query.perPage, 10) || 10));
  const search = (query.search || "").trim();
  const category = (query.category || "").trim();
  const status = (query.status || "").trim();
  const sellerId = (query.sellerId || "").trim();
  const paymentStatus = (query.paymentStatus || "").trim();
  const deliveryStatus = (query.deliveryStatus || "").trim();

  return {
    page,
    perPage,
    skip: (page - 1) * perPage,
    search,
    category,
    status,
    sellerId,
    paymentStatus,
    deliveryStatus,
  };
};

const textSearchFilter = (search, fields) => {
  if (!search) return {};
  const regex = new RegExp(search, "i");
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
};

module.exports = { buildListQuery, textSearchFilter };
