import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import type { NextPageWithLayout } from "../_app";
import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { ProductCatalogCard } from "@/components/shared/product/ProductCatalogCard";
import { api } from "@/utils/api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProductForm } from "@/components/shared/product/ProductForm";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { productFormSchema, type ProductFormSchema } from "@/forms/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { Notification } from "@/components/ui/notification";
import {
  deleteFileFromBucket,
  extractPathFromSupabaseUrl,
} from "@/lib/supabase";
import { Bucket } from "@/server/bucket";
import { NotificationType } from "@/types";

type UpdateProductSchema = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
};

const ProductsPage: NextPageWithLayout = () => {
  // LOCAL STATES -----------------------------------------------------
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType.SUCCESS | NotificationType.FAILED;
  } | null>(null);
  const [uploadedCreateProductImageUrl, setUploadedCreateProductImageUrl] =
    useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [deleteUploadImageUrl, setDeleteUploadImageUrl] = useState<
    string | null
  >(null);
  const [createProductDialogOpen, setCreateProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // FORMS ------------------------------------------------------------
  const createProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });

  const updateProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });

  const apiUtils = api.useUtils();

  const showNotification = (
    message: string,
    type: NotificationType.SUCCESS | NotificationType.FAILED,
  ) => setNotification({ message, type });

  // API CALLS --------------------------------------------------------
  // get/read products
  const { data: products } = api.product.getProducts.useQuery({
    categoryId: "ALL",
  });

  // create a product
  const { mutate: createProduct } = api.product.createProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();

      showNotification(
        "Successfully created new product",
        NotificationType.SUCCESS,
      );
      setCreateProductDialogOpen(false);
      setUploadedCreateProductImageUrl(null);
      createProductForm.reset();
    },
    onError: (error) => {
      const message =
        error.data?.zodError?.fieldErrors?.name?.[0] ?? error.message;

      showNotification(message, NotificationType.FAILED);
    },
  });

  // update a product
  const { mutate: updateProduct } = api.product.updateProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();

      showNotification(
        "Successfully updated product",
        NotificationType.SUCCESS,
      );
      if (deleteUploadImageUrl) {
        await deleteFileFromBucket({
          path: deleteUploadImageUrl,
          bucket: Bucket.ProductImages,
        });
      }

      setEditProductDialogOpen(false);
      setUploadedImageUrl(null);
      setDeleteUploadImageUrl(null);
      updateProductForm.reset();
    },
    onError: (error) => {
      const message =
        error.data?.zodError?.fieldErrors?.name?.[0] ?? error.message;

      showNotification(message, NotificationType.FAILED);
    },
  });

  // delete a product
  const { mutate: deleteProduct } = api.product.deleteProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();

      showNotification(
        "Successfully deleted product",
        NotificationType.SUCCESS,
      );
      setDeleteProductDialogOpen(false);
    },
  });

  // HANDLERS ---------------------------------------------------------
  // create a product
  const handleCreate = (values: ProductFormSchema) => {
    if (!uploadedCreateProductImageUrl) {
      showNotification(
        "Please upload a product image first",
        NotificationType.FAILED,
      );

      return;
    }

    createProduct({
      name: values.name,
      price: values.price,
      categoryId: values.categoryId,
      imageUrl: uploadedCreateProductImageUrl,
    });
  };

  // update a product
  const handleUpdate = (values: ProductFormSchema) => {
    if (!productToUpdate) return;

    updateProduct({
      id: productToUpdate,
      ...values,
      imageUrl: uploadedImageUrl ?? "",
    });
  };

  const handleClickUpdate = (product: UpdateProductSchema) => {
    setProductToUpdate(product.id);
    setEditProductDialogOpen(true);
    setUploadedImageUrl(product.imageUrl ?? "");

    if (product.imageUrl) {
      const path = extractPathFromSupabaseUrl(product.imageUrl);
      setDeleteUploadImageUrl(path);
    }

    updateProductForm.reset({
      name: product.name,
      price: product.price,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl ?? "",
    });
  };

  // delete a product
  const handleDelete = () => {
    if (!productToDelete) return;

    deleteProduct({ id: productToDelete });
  };

  const handleClickDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteProductDialogOpen(true);
  };

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Product Management</DashboardTitle>

            <DashboardDescription>
              View, add, edit, and delete products in your inventory.
            </DashboardDescription>
          </div>

          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}

          {/* MODAL FOR CREATE A PRODUCT */}
          <AlertDialog
            open={createProductDialogOpen}
            onOpenChange={setCreateProductDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Add New Product</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create Product</AlertDialogTitle>
              </AlertDialogHeader>

              <Form {...createProductForm}>
                <ProductForm
                  onSubmit={handleCreate}
                  onChangeImageUrl={(url) =>
                    setUploadedCreateProductImageUrl(url)
                  }
                  showNotification={showNotification}
                />
              </Form>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <Button onClick={createProductForm.handleSubmit(handleCreate)}>
                  Create Category
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <ProductCatalogCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.imageUrl ?? ""}
            category={product.category.name}
            onEdit={() =>
              handleClickUpdate({
                id: product.id,
                name: product.name,
                price: product.price,
                categoryId: product.category.id,
                imageUrl: product.imageUrl ?? "",
              })
            }
            onDelete={() => handleClickDelete(product.id)}
          />
        ))}
      </div>

      {/* MODAL FOR UPDATE A PRODUCT */}
      <AlertDialog
        open={editProductDialogOpen}
        onOpenChange={setEditProductDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Product</AlertDialogTitle>
          </AlertDialogHeader>

          <Form {...updateProductForm}>
            <ProductForm
              onSubmit={handleUpdate}
              onChangeImageUrl={(url) => setUploadedImageUrl(url)}
              showNotification={showNotification}
            />
          </Form>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={updateProductForm.handleSubmit(handleUpdate)}>
              Update Product
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL FOR DELETE A PRODUCT */}
      <AlertDialog
        open={deleteProductDialogOpen}
        onOpenChange={setDeleteProductDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this product?
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default ProductsPage;
