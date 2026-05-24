const formidable = require("formidable");
const ProductModel = require("../../models/productModel");
const { responseReturn } = require("../../utils/responseReturn");
const { buildListQuery, textSearchFilter } = require("../../utils/queryHelper");
const cloudinary = require("cloudinary").v2;



class productController {
  // add_product = async (req, res) => {
  //   const form = formidable({ multiples: true});
  //
  //   form.parse(req, async (err, fields, files) => {
  //
  //     const field = fields;
  //     const images = files;
  //     console.log(images);
  //     if (err) {
  //       return responseReturn(res, 400, { error: err.message });
  //     }
  //
  //     try {
  //       const title = field.title;
  //       const brand = field.brands;
  //
  //       const category = field.category;
  //       const stock = field.stock;
  //       const price = field.price;
  //       const discount = field.discount;
  //       const description = field.description;
  //       const sellerId = field.sellerId;
  //
  //       if (!title || !category) {
  //         return responseReturn(res, 400, {
  //           error: "Title and category are required",
  //         });
  //       }
  //
  //
  //       cloudinary.config({
  //         cloud_name: process.env.cloud_name,
  //         api_key:  process.env.api_key,
  //         api_secret: process.env.api_secret
  //       });
  //       if (images && images.length > 0) {
  //           const result = await cloudinary.uploader.upload(images.pathname, {folder : "products"});
  //           if(result) {
  //             const slug = title.trim().toLowerCase().split(/\s+/).join("-");
  //             const photos = [];
  //             result.map((item) => {
  //               photos.push(item.url)
  //             })
  //             const product = await ProductModel.create({
  //               title,
  //               slug,
  //               brand,
  //               category,
  //               stock,
  //               price,
  //               discount,
  //               description,
  //               images : photos,
  //               sellerId,
  //             });
  //             responseReturn(res, 201, {
  //               product,
  //               message: "Product added successfully",
  //             });
  //           }
  //           else{
  //             console.log("error");
  //           }
  //       }
  //
  //     } catch (error) {
  //       responseReturn(res, 500, { error: error.message });
  //     }
  //   });
  // };

  add_product = async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return responseReturn(res, 400, { error: err.message });
      }

      try {
        // 1. Safely extract your fields (handling potential array wrapping in v2)
        const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
        const brand = Array.isArray(fields.brands) ? fields.brands[0] : fields.brands;
        const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
        const stock = Array.isArray(fields.stock) ? fields.stock[0] : fields.stock;
        const price = Array.isArray(fields.price) ? fields.price[0] : fields.price;
        const discount = Array.isArray(fields.discount) ? fields.discount[0] : fields.discount;
        const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
        const sellerId = Array.isArray(fields.sellerId) ? fields.sellerId[0] : fields.sellerId;

        if (!title || !category) {
          return responseReturn(res, 400, { error: "Title and category are required" });
        }

        // 2. Configure Cloudinary
        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key:  process.env.api_key,
          api_secret: process.env.api_secret
        });

        const photos = [];

        // 3. Target the specific key 'images' inside files and normalize it into an array
        if (files && files.images) {
          const imageList = Array.isArray(files.images) ? files.images : [files.images];

          // 4. Loop over files sequentially using a clean for...of loop
          for (const fileItem of imageList) {
            if (fileItem.filepath) {
              const result = await cloudinary.uploader.upload(fileItem.filepath, { folder: "products" });
              if (result && result.url) {
                photos.push(result.url); // Push individual secure URL strings
              }
            }
          }
        }

        // 5. Ensure at least one image uploaded successfully if required
        if (photos.length === 0) {
          return responseReturn(res, 400, { error: "Please upload at least one valid product image" });
        }

        // 6. Generate Slug and write entry to Database
        const slug = title.trim().toLowerCase().split(/\s+/).join("-");

        const product = await ProductModel.create({
          title,
          slug,
          brand,
          category,
          stock: Number(stock) || 0,
          price: Number(price) || 0,
          discount: Number(discount) || 0,
          description,
          images: photos, // Contains your array of uploaded cloud URLs
          sellerId,
        });

        return responseReturn(res, 201, {
          product,
          message: "Product added successfully",
        });

      } catch (error) {
        return responseReturn(res, 500, { error: error.message });
      }
    });
  };
  get_products = async (req, res) => {
    try {
      const { page, perPage, skip, search, category, status, sellerId } =
        buildListQuery(req.query);

      const filter = {
        ...textSearchFilter(search, ["title", "brand", "category", "description"]),
      };
      if (category && category !== "default" && category !== "All Categories") {
        filter.category = new RegExp(`^${category}$`, "i");
      }
      if (status) filter.status = status;
      const scopedSellerId =
        req.role === "seller" ? String(req.id) : sellerId;
      if (scopedSellerId) filter.sellerId = scopedSellerId;

      const totalItems = await ProductModel.countDocuments(filter);
      const products = await ProductModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage);

      responseReturn(res, 200, {
        products,
        totalItems,
        page,
        perPage,
        message: "Products fetched",
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_product = async (req, res) => {
    try {
      const { id } = req.params;
      const product =
        (await ProductModel.findById(id)) ||
        (await ProductModel.findOne({ slug: id }));

      if (!product) {
        return responseReturn(res, 404, { error: "Product not found" });
      }
      responseReturn(res, 200, { product });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  delete_product = async (req, res) => {
    try {
      const { id } = req.body;
      const product = await ProductModel.findByIdAndDelete(id);
      if (!product) {
        return responseReturn(res, 404, { error: "Product not found" });
      }
      responseReturn(res, 200, { message: "Product deleted" });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  update_product_status = async (req, res) => {
    try {
      const { id, status } = req.body;
      const product = await ProductModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!product) {
        return responseReturn(res, 404, { error: "Product not found" });
      }
      responseReturn(res, 200, { product, message: "Status updated" });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  update_product = async (req, res) => {
    try {
      const { _id, title, brand, category, stock, price, discount, description } = req.body;
      const product = await ProductModel.findByIdAndUpdate(
        _id,
        { title, brand, category, stock, price, discount, description },
        { new: true }
      );
      if (!product) {
        return responseReturn(res, 404, { error: "Product not found" });
      }
      responseReturn(res, 200, { product, message: "Product updated successfully" });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}

module.exports = new productController();
