import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send } from "lucide-react";

interface TaskInputProps {
  onSubmit: (goal: string) => void;
  isLoading?: boolean;
}

export function TaskInput({ onSubmit, isLoading = false }: TaskInputProps) {
  const [goal, setGoal] = useState("");

  const handleSubmit = () => {
    if (goal.trim() && !isLoading) {
      onSubmit(goal.trim());
      setGoal("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card data-testid="card-task-input">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold">New Task</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Describe your goal and let the AI agents orchestrate the solution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Example: Create a comprehensive market analysis report for electric vehicles in North America, including key players, market trends, and future projections..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-32 resize-none text-sm"
          disabled={isLoading}
          data-testid="input-goal"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Enter</kbd> to submit, <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Shift+Enter</kbd> for new line
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!goal.trim() || isLoading}
            className="gap-2"
            data-testid="button-submit-goal"
          >
            {isLoading ? (
              <>Processing...</>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Execute
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
