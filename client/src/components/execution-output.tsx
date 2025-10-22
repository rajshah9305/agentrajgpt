import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AgentLog } from "@shared/schema";
import { getAgentTextClass, agentNames, getRelativeTime } from "@/lib/agent-utils";
import { Terminal, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExecutionOutputProps {
  logs: AgentLog[];
  isLive?: boolean;
}

export function ExecutionOutput({ logs, isLive = false }: ExecutionOutputProps) {
  const getLevelIcon = (level: string) => {
    switch (level) {
      case "success":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case "error":
        return <XCircle className="h-3 w-3 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      default:
        return <Info className="h-3 w-3 text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-blue-500";
    }
  };

  return (
    <Card className="flex flex-col h-full" data-testid="card-execution-output">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4 border-b">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Execution Output</CardTitle>
        </div>
        {isLive && (
          <Badge variant="outline" className="text-xs">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2 font-mono text-xs" data-testid="log-container">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>No logs yet. Start an execution to see output.</p>
              </div>
            ) : (
              logs.map((log, index) => {
                const level = (log.metadata as any)?.level || "info";
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                    data-testid={`log-entry-${index}`}
                  >
                    <div className="flex items-center gap-2 flex-shrink-0 w-32">
                      {getLevelIcon(level)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`flex-shrink-0 text-xs ${getAgentTextClass(log.agentType as any)}`}
                    >
                      {agentNames[log.agentType as any] || log.agentType}
                    </Badge>
                    <div className="flex-1 space-y-1">
                      <p className={`font-medium ${getLevelColor(level)}`}>
                        {log.action}
                      </p>
                      {log.reasoning && (
                        <p className="text-muted-foreground text-xs">
                          {log.reasoning}
                        </p>
                      )}
                      {log.output && typeof log.output === 'object' && (
                        <pre className="text-xs text-muted-foreground mt-1 p-2 bg-muted/30 rounded overflow-x-auto">
                          {JSON.stringify(log.output as any, null, 2)}
                        </pre>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
