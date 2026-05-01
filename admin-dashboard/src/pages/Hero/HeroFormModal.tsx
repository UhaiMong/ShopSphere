import { useState } from "react";
import { useForm } from "react-hook-form";
import { ImagePlus, X } from "lucide-react";
import { apiPatch, apiPost, apiPut } from "@/services/api";
import type { Hero } from "@/types";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import MediaPickerModal from "../Media/MediaPickerModal";

type PickerMode = "multiple" | "single" | null;

interface HeroSlideForm {
  title: string;
  subtitle: string;
  offer?: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  isActive: boolean;
}

export const HeroFormModal = ({
  hero,
  onClose,
  onSaved,
}: {
  hero?: Hero | null;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const isEdit = Boolean(hero);
  const [image, setImage] = useState<string>(hero?.backgroundImage ?? "");
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  const closePicker = () => setPickerMode(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HeroSlideForm>({
    defaultValues: {
      title: hero?.title ?? "",
      subtitle: hero?.subtitle ?? "",
      offer: hero?.offer ?? "",
      ctaText: hero?.ctaText ?? "",
      ctaLink: hero?.ctaLink ?? "",
      backgroundImage: hero?.backgroundImage ?? "",
      isActive: hero?.isActive ?? true,
    },
  });

  const onSubmit = async (data: HeroSlideForm) => {
    const payload = {
      ...data,
      backgroundImage: image,
    };
    console.log("Hero: ", payload);
    try {
      if (isEdit && hero) {
        await apiPatch(`/hero/${hero._id}`, payload);
        toast.success("Hero slide updated");
      } else {
        await apiPost("/hero", payload);
        toast.success("Hero slide created");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed");
    }
  };

  return (
    <>
      <Modal
        isOpen
        title={isEdit ? "Edit Product" : "New Product"}
        onClose={onClose}
        size="xl"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
        >
          {/* Image */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              Image
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover rounded-lg border border-zinc-700"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImage("");
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full
                      flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              <button
                type="button"
                onClick={() => setPickerMode("single")}
                className="w-24 h-24 border-2 border-dashed border-zinc-700 rounded-lg
                  flex flex-col items-center justify-center cursor-pointer
                  hover:border-zinc-500 transition-colors"
              >
                <ImagePlus className="w-4 h-4 text-zinc-600" />
                <span className="text-[10px] text-zinc-600 mt-1">Add</span>
              </button>
            </div>
          </div>

          {/*  Fields  */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Hero Title *"
                error={errors.title?.message}
                {...register("title", { required: "Title is required" })}
              />
            </div>

            <Input
              label="Sub title *"
              error={errors.subtitle?.message}
              {...register("subtitle", { required: "Subtitle is required" })}
            />
          </div>
          <Input
            label="Offer Text(short)"
            error={errors.offer?.message}
            {...register("offer")}
          />
          <Input label="CTA Text" {...register("ctaText")} />
          <Input label="CTA Link" {...register("ctaLink")} />

          <div className="flex gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                {...register("isActive")}
                className="accent-orange-500"
              />
              <span className="text-sm text-zinc-300">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Sigle-select picker — appends new URLs, skips duplicates */}
      <MediaPickerModal
        open={pickerMode === "single"}
        onClose={closePicker}
        onSelect={(backgroundImage) => setImage(backgroundImage)}
      />
    </>
  );
};
