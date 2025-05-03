import { useMutation } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Step<T = unknown> {
  title: string;
  description: string;
  action: (data?: T) => Promise<unknown>;
}

interface FlowDialogProps {
  open: boolean;
  onClose: () => void;
  steps: Step<unknown>[];
  onSuccess?: (result: unknown) => void;
  onError?: (error: Error) => void;
}

export const FlowDialog = ({ open, onClose, steps, onSuccess, onError }: FlowDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const hasStarted = useRef(false);
  const currentStepRef = useRef(0);
  const stepDataRef = useRef<unknown>(null);

  const { mutate: executeStep, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const result = await steps[currentStepRef.current].action(stepDataRef.current);
        if (currentStepRef.current < steps.length - 1) {
          stepDataRef.current = result;
          const nextStep = currentStepRef.current + 1;
          currentStepRef.current = nextStep;
          setCurrentStep(nextStep);
          // 自动执行下一步
          executeStep();
        } else {
          onSuccess?.(result);
          onClose();
        }
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Operation failed';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        onClose();
        throw err;
      }
    },
  });

  // 当对话框打开时，开始执行第一个步骤
  useEffect(() => {
    if (open && currentStep === 0 && !hasStarted.current) {
      hasStarted.current = true;
      currentStepRef.current = 0;
      stepDataRef.current = null;
      executeStep();
    }
  }, [open, currentStep, executeStep]);

  const handleClose = () => {
    if (isPending) {
      setShowCloseConfirm(true);
    } else {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setCurrentStep(0);
    currentStepRef.current = 0;
    setError(null);
    stepDataRef.current = null;
    hasStarted.current = false;
    setShowCloseConfirm(false);
    onClose();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Operation Flow</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card
                key={index}
                className={cn(
                  'p-4 transition-opacity',
                  index === currentStep ? 'opacity-100' : 'opacity-50'
                )}
              >
                <h3 className="font-semibold">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </DialogContent>

      {showCloseConfirm && (
        <Dialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Exit</DialogTitle>
            </DialogHeader>
            <p>The operation is in progress. Are you sure you want to exit?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCloseConfirm(false)}>
                Continue
              </Button>
              <Button variant="destructive" onClick={resetAndClose}>
                Exit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}; 