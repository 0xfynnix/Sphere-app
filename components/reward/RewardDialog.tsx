'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (amount: number) => void;
}

const rewardOptions = [
  { amount: 1, label: '1 SUI' },
  { amount: 5, label: '5 SUI' },
  { amount: 10, label: '10 SUI' },
  { amount: 50, label: '50 SUI' },
];

export function RewardDialog({ isOpen, onClose, onReward }: RewardDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  const handleTap = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % rewardOptions.length);
    setAnimationKey(prev => prev + 1);
  };

  const handleReward = () => {
    onReward(rewardOptions[currentIndex].amount);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reward Creator</DialogTitle>
          <DialogDescription>
            Tap to cycle through reward amounts.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className="h-20 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={animationKey}
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: -50 }}
                transition={{ 
                  type: "spring",
                  stiffness: 1000,
                  damping: 50,
                  mass: 0.5,
                  duration: 0.1
                }}
                className="text-4xl font-bold text-primary"
              >
                {rewardOptions[currentIndex].label}
              </motion.div>
            </AnimatePresence>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="h-20 w-20 rounded-full"
            onClick={handleTap}
          >
            <Hand className="h-8 w-8" />
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleReward}>
            Confirm Reward
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 