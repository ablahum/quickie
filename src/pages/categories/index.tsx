import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import { CategoryCatalogCard } from "@/components/shared/category/CategoryCatalogCard";
import { CategoryForm } from "@/components/shared/category/CategoryForm";
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
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { categoryFormSchema, type CategoryFormSchema } from "@/forms/category";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactElement } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { NextPageWithLayout } from "../_app";
import { api } from "@/utils/api";
import { Notification } from "@/components/ui/notification";
import { NotificationType } from "@/types";

type UpdateCategorySchema = {
  id: string;
  name: string;
};

const CategoriesPage: NextPageWithLayout = () => {
  // LOCAL STATES -----------------------------------------------------
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType.SUCCESS | NotificationType.FAILED;
  } | null>(null);
  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] =
    useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [categoryToUpdate, setCategoryToUpdate] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // FORMS ------------------------------------------------------------
  const createCategoryForm = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
  });

  const editCategoryForm = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
  });

  const apiUtils = api.useUtils();

  const showNotification = (
    message: string,
    type: NotificationType.SUCCESS | NotificationType.FAILED,
  ) => setNotification({ message, type });

  // API CALLS --------------------------------------------------------
  // get/read categories
  const { data: categories, isLoading: isCategoryLoading } =
    api.category.getCategories.useQuery();

  // create a category
  const { mutate: createCategory } = api.category.createCategory.useMutation({
    onSuccess: async () => {
      await apiUtils.category.getCategories.invalidate();

      showNotification(
        "Successfully created a new category",
        NotificationType.SUCCESS,
      );
      setCreateCategoryDialogOpen(false);
      createCategoryForm.reset();
    },
    onError: (error) => {
      const message =
        error.data?.zodError?.fieldErrors?.name?.[0] ?? error.message;

      showNotification(message, NotificationType.FAILED);
    },
  });

  // update a category
  const { mutate: editCategory } = api.category.editCategory.useMutation({
    onSuccess: async () => {
      await apiUtils.category.getCategories.invalidate();

      showNotification(
        "Successfully edited a category",
        NotificationType.SUCCESS,
      );
      editCategoryForm.reset();
      setCategoryToUpdate(null);
      setEditCategoryDialogOpen(false);
    },
    onError: (error) => {
      const message =
        error.data?.zodError?.fieldErrors?.name?.[0] ?? error.message;

      showNotification(message, NotificationType.FAILED);
    },
  });

  // delete a category
  const { mutate: deleteCategory } = api.category.deleteCategory.useMutation({
    onSuccess: async () => {
      await apiUtils.category.getCategories.invalidate();

      showNotification(
        "Successfully deleted a category",
        NotificationType.SUCCESS,
      );
      setCategoryToDelete(null);
    },
  });

  // HANDLERS ---------------------------------------------------------
  // create a category
  const handleCreate = (data: CategoryFormSchema) =>
    createCategory({ name: data.name });

  // update a category
  const handleUpdate = (data: CategoryFormSchema) => {
    if (!categoryToUpdate) return;

    editCategory({ name: data.name, id: categoryToUpdate });
  };

  const handleClickUpdate = (category: UpdateCategorySchema) => {
    setCategoryToUpdate(category.id);
    setEditCategoryDialogOpen(true);

    editCategoryForm.reset({ name: category.name });
  };

  // delete a category
  const handleDelete = () => {
    if (!categoryToDelete) return;

    deleteCategory({ id: categoryToDelete });
  };

  const handleClickDelete = (id: string) => setCategoryToDelete(id);

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Category Management</DashboardTitle>

            <DashboardDescription>
              Organize your products with custom categories.
            </DashboardDescription>
          </div>

          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}

          {/* MODAL FOR CREATE A CATEGORY */}
          <AlertDialog
            open={createCategoryDialogOpen}
            onOpenChange={setCreateCategoryDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Add New Category</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Category</AlertDialogTitle>
              </AlertDialogHeader>

              <Form {...createCategoryForm}>
                <CategoryForm onSubmit={handleCreate} />
              </Form>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <Button onClick={createCategoryForm.handleSubmit(handleCreate)}>
                  Create Category
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-4 gap-4">
        {isCategoryLoading ? (
          <p>Loading...</p>
        ) : (
          categories?.map((category) => (
            <CategoryCatalogCard
              key={category.id}
              name={category.name}
              productCount={category.productCount}
              onDelete={() => handleClickDelete(category.id)}
              onEdit={() =>
                handleClickUpdate({
                  id: category.id,
                  name: category.name,
                })
              }
            />
          ))
        )}
      </div>

      {/* MODAL FOR UPDATE A CATEGORY */}
      <AlertDialog
        open={editCategoryDialogOpen}
        onOpenChange={setEditCategoryDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Category</AlertDialogTitle>
          </AlertDialogHeader>

          <Form {...editCategoryForm}>
            <CategoryForm onSubmit={handleUpdate} />
          </Form>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <Button onClick={editCategoryForm.handleSubmit(handleUpdate)}>
              Edit Category
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL FOR DELETE A CATEGORY */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogDescription>
            Are you sure you want to delete this category? This action cannot be
            undone.
          </AlertDialogDescription>

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

CategoriesPage.getLayout = (page: ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default CategoriesPage;
