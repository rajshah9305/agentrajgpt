import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TaskInputProps {
  onSubmit: (goal: string) => void;
  isLoading?: boolean;
}

const DRAFT_STORAGE_KEY = "rajgpt_task_draft";

export function TaskInput({ onSubmit, isLoading = false }: TaskInputProps) {
  const [goal, setGoal] = useState("");
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const draftTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      setGoal(savedDraft);
    }
  }, []);

  useEffect(() => {
    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
    }

    if (goal.trim()) {
      draftTimerRef.current = setTimeout(() => {
        localStorage.setItem(DRAFT_STORAGE_KEY, goal);
        setShowDraftSaved(true);
        setTimeout(() => setShowDraftSaved(false), 2000);
      }, 1000);
    } else {
      // Clear draft when textarea is emptied
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }

    return () => {
      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
      }
    };
  }, [goal]);

  const handleSubmit = () => {
    if (goal.trim() && !isLoading) {
      onSubmit(goal.trim());
      setGoal("");
      localStorage.removeItem(DRAFT_STORAGE_KEY);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">New Task</CardTitle>
          </div>
          <AnimatePresence>
            {showDraftSaved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                <Save className="h-3 w-3" />
                <span>Draft saved</span>
              </motion.div>
            )}
          </AnimatePresence>
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
