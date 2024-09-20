"use client";
import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface APIRequestFormProps {
  onSubmit: (email: string) => Promise<void>;
}

export default function APIRequestForm({ onSubmit }: APIRequestFormProps) {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Invalid Email Address!");
      return;
    } else {
      setError("");
    }
    setIsLoading(true);
    try {
      await onSubmit(email);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id={`email-field-id`}
        label="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        required
      />

      <Button
        type="submit"
        isLoading={isLoading}
        disabled={email.length === 0}
        className="w-full flex items-center justify-center"
      >
        Submit
      </Button>
    </form>
  );
}
