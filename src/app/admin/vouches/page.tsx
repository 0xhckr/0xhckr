"use client";

import { useMutation, useQuery } from "convex/react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function AdminVouchesPage() {
  const vouches = useQuery(api.vouches.list);
  const createVouch = useMutation(api.vouches.create);
  const updateVouch = useMutation(api.vouches.update);
  const removeVouch = useMutation(api.vouches.remove);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<Id<"vouches"> | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const handleCreate = async () => {
    if (!name.trim() || !url.trim()) return;
    await createVouch({ name: name.trim(), url: url.trim() });
    setName("");
    setUrl("");
  };

  const startEditing = (vouch: {
    _id: Id<"vouches">;
    name: string;
    url: string;
  }) => {
    setEditingId(vouch._id);
    setEditName(vouch.name);
    setEditUrl(vouch.url);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditUrl("");
  };

  const handleUpdate = async () => {
    if (!editingId || !editName.trim() || !editUrl.trim()) return;
    await updateVouch({
      id: editingId,
      name: editName.trim(),
      url: editUrl.trim(),
    });
    cancelEditing();
  };

  const handleRemove = async (id: Id<"vouches">) => {
    if (editingId === id) cancelEditing();
    await removeVouch({ id });
  };

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="tw-content flex min-h-screen flex-col items-center px-4 pt-admin-navbar py-16 sm:px-8">
        <div className="flex items-center justify-between w-full max-w-2xl mb-8">
          <h1 className="text-2xl font-semibold tracking-tight lowercase">
            Manage Vouches
          </h1>
        </div>

        {/* Add form */}
        <div className="w-full max-w-2xl mb-8 space-y-3 rounded-md border border-border/50 p-4">
          <p className="text-sm text-muted-foreground lowercase">Add a vouch</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
            <Button
              onClick={handleCreate}
              variant="outline"
              size="icon"
              aria-label="Add vouch"
              disabled={!name.trim() || !url.trim()}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        {/* List */}
        {vouches === undefined && (
          <p className="text-muted-foreground lowercase">Loading...</p>
        )}

        {vouches && vouches.length === 0 && (
          <p className="text-muted-foreground lowercase">
            No vouches found. Add one above to get started.
          </p>
        )}

        {vouches && vouches.length > 0 && (
          <div className="w-full max-w-2xl space-y-2">
            {vouches.map((vouch) => {
              const isEditing = editingId === vouch._id;

              return (
                <div
                  key={vouch._id}
                  className="flex items-center justify-between rounded-md border border-border/50 p-4"
                >
                  {isEditing ? (
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                      <Input
                        size="sm"
                        placeholder="Name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate();
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                      <Input
                        size="sm"
                        placeholder="https://example.com"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate();
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={handleUpdate}
                          aria-label="Save"
                          disabled={!editName.trim() || !editUrl.trim()}
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={cancelEditing}
                          aria-label="Cancel"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {vouch.name}
                        </p>
                        <a
                          href={vouch.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:underline truncate block"
                        >
                          {vouch.url}
                        </a>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => startEditing(vouch)}
                          aria-label={`Edit ${vouch.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemove(vouch._id)}
                          aria-label={`Remove ${vouch.name}`}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
