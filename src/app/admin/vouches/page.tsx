"use client";

import { useMutation, useQuery } from "convex/react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import {
  AdminPageHeader,
  AdminSection,
  AdminShell,
  EmptyState,
} from "~/components/admin/ui";
import { Reveal } from "~/components/reveal";
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
    <AdminShell>
      <AdminPageHeader eyebrow="admin / vouches" title="Vouches" />

      <AdminSection index="01" title="add a vouch">
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
      </AdminSection>

      <AdminSection index="02" title="all vouches">
        {vouches === undefined && (
          <p className="font-mono text-xs text-muted-foreground lowercase">
            loading...
          </p>
        )}

        {vouches && vouches.length === 0 && (
          <EmptyState>no vouches yet — add one above.</EmptyState>
        )}

        {vouches && vouches.length > 0 && (
          <Reveal>
            {vouches.map((vouch, i) => {
              const isEditing = editingId === vouch._id;

              return (
                <div
                  key={vouch._id}
                  className="reveal-item border-t hairline py-4 last:border-b"
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
                    <div className="flex items-center gap-5">
                      <span className="font-mono text-xs text-muted-foreground/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-sans text-sm font-medium text-foreground">
                          {vouch.name}
                        </p>
                        <a
                          href={vouch.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate font-mono text-xs text-muted-foreground transition-colors hover:text-accent"
                        >
                          {vouch.url}
                        </a>
                      </div>
                      <div className="flex gap-1">
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
                          <Trash2 className="size-4 text-destructive-foreground" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </Reveal>
        )}
      </AdminSection>
    </AdminShell>
  );
}
