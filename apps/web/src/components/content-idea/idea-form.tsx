"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { ButtonPrimary } from "../ui/button-primary";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface IdeaFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function IdeaForm({ onSuccess, onCancel }: IdeaFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createIdea = useMutation(api.mutations.contentIdeas.createContentIdea);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createIdea({
        title: title.trim(),
        description: description.trim(),
        platform: platform as
          | "tiktok"
          | "instagram"
          | "youtube"
          | "x"
          | "facebook"
          | "threads"
          | "other"
          | undefined,
      });
      toast.success("Content idea created successfully!");
      setTitle("");
      setDescription("");
      setPlatform(undefined);
      onSuccess();
    } catch (error) {
      console.error("Error creating content idea:", error);
      toast.error("Failed to create content idea. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter content idea title..."
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your content idea..."
          rows={4}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform">Platform (Optional)</Label>
        <Select
          value={platform}
          onValueChange={setPlatform}
          disabled={isSubmitting}
        >
          <SelectTrigger id="platform">
            <SelectValue placeholder="Select platform..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="x">X (Twitter)</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="threads">Threads</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 justify-end">
        <ButtonPrimary
          type="button"
          tone="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </ButtonPrimary>
        <ButtonPrimary type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Idea"
          )}
        </ButtonPrimary>
      </div>
    </form>
  );
}

