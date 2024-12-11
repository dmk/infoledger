import { EntryCreationForm } from "@/components/EntryCreationForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Create New Entry',
  description: 'Create a new entry in the InfoLedger',
}

export default function NewEntryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Create New Entry</h1>
      <EntryCreationForm />
    </div>
  );
}
