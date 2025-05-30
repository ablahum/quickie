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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { productFormSchema, type ProductFormSchema } from "@/forms/product";
import { ProductForm } from "@/components/shared/product/ProductForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const ProductsPage: NextPageWithLayout = () => {
  // LOCAL STATE
  const [createProductDialogOpen, setCreateProductDialogOpen] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<string>("0");
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // USE FORM ----------------------------------------------------
  const createProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });
  const editProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });

  const apiUtils = api.useUtils();

  // API CALL ----------------------------------------------------
  // get/read
  const { data: products, isLoading: isProductLoading } =
    api.product.getProducts.useQuery();

  // create
  const { mutate: createProduct, isPending: isCreateProductPending } =
    api.product.createProduct.useMutation({
      onSuccess: async () => {
        await apiUtils.product.getProducts.invalidate();

        alert("Successfully created new product");
        setCreateProductDialogOpen(false);
        createProductForm.reset();
      },
    });

  // edit/update
  const { mutate: editProduct, isPending: isEditProductPending } =
    api.product.editProduct.useMutation({
      onSuccess: async () => {
        await apiUtils.product.getProducts.invalidate();

        alert("Successfully edited a product");
        setEditProductDialogOpen(false);
      },
    });

  // delete
  const { mutate: deleteProduct, isPending: isDeleteProductPending } =
    api.product.deleteProductById.useMutation({
      onSuccess: async () => {
        await apiUtils.product.getProducts.invalidate();

        alert("Successfully deleted a product");
        setProductToDelete(null);
      },
    });

  // HANDLERS ----------------------------------------------------
  // create
  const handelSubmitCreateProduct = (values: ProductFormSchema) => {
    if (!uploadedImageUrl) {
      alert("Please upload an image or waiting for the image to be uploaded");
      return;
    }

    createProduct({
      name: values.name,
      price: values.price,
      categoryId: values.categoryId,
      imageUrl: uploadedImageUrl,
    });
  };

  // update
  const handleSubmitEditProduct = (data: ProductFormSchema) => {
    if (!productToEdit) return;

    editProduct({
      id: productToEdit,
      name: data.name,
      price: data.price,
      categoryId: data.categoryId,
      imageUrl: uploadedImageUrl!,
    });
  };

  const handleClickEditproduct = (product: {
    id: string;
    name: string;
    price: number;
    categoryId: string;
    imageUrl: string;
  }) => {
    setEditProductDialogOpen(true);
    setProductToEdit(product.id);

    editProductForm.reset({
      name: product.name,
      price: product.price,
      categoryId: product.categoryId,
      // imageUrl: product.imageUrl,
    });
    // setUploadedImageUrl(product.imageUrl); // pindahkan ke state tersendiri
  };

  // delete
  const handleClickDeleteProduct = (productId: string) =>
    setProductToDelete(productId);

  const handleConfirmDeleteProduct = () =>
    deleteProduct({ id: productToDelete! });

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
                  onSubmit={handelSubmitCreateProduct}
                  submitText="Create Product"
                  onChangeImageUrl={setUploadedImageUrl}
                />
              </Form>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <Button
                  onClick={createProductForm.handleSubmit(
                    handelSubmitCreateProduct,
                  )}
                  disabled={isCreateProductPending}
                >
                  {isCreateProductPending && (
                    <Loader2 className="animate-spin" />
                  )}
                  Create Product
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isProductLoading ? (
          <p>Loading...</p>
        ) : (
          products?.map((product) => (
            <ProductCatalogCard
              key={product.id}
              name={product.name}
              price={product.price}
              image={product.imageUrl ?? ""}
              category={product.category.name}
              onEdit={() =>
                handleClickEditproduct({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  categoryId: product.category.id,
                  imageUrl: product.imageUrl ?? "",
                })
              }
              onDelete={() => handleClickDeleteProduct(product.id)}
            />
          ))
        )}
      </div>

      <AlertDialog
        open={editProductDialogOpen}
        onOpenChange={setEditProductDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Product</AlertDialogTitle>
          </AlertDialogHeader>
          <Form {...editProductForm}>
            <ProductForm
              onSubmit={handleSubmitEditProduct}
              submitText="Edit Product"
              onChangeImageUrl={setUploadedImageUrl}
            />
          </Form>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={editProductForm.handleSubmit(handleSubmitEditProduct)}
              disabled={isEditProductPending}
            >
              {isEditProductPending && <Loader2 className="animate-spin" />}
              Edit Product
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setProductToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteProduct}
              disabled={isDeleteProductPending}
            >
              {isDeleteProductPending && <Loader2 className="animate-spin" />}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductsPage;
