import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserType } from "@/lib/api/types";

interface UserTypeSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: UserType) => void;
}

export const userTypes = [
  {
    type: UserType.ARTIST,
    name: "Artist",
    description: "Create art and NFTs",
    color: "#800080"
  },
  {
    type: UserType.GEEK,
    name: "Geek",
    description: "Share tech knowledge",
    color: "#00FF99"
  },
  {
    type: UserType.STORYTELLER,
    name: "Storyteller",
    description: "Write and share stories",
    color: "#FF4500"
  },
  {
    type: UserType.MEME_LORD,
    name: "Meme Lord",
    description: "Create and share memes",
    color: "#FFFF00"
  },
  {
    type: UserType.EXPLORER,
    name: "Explorer",
    description: "Try new content forms",
    color: "#C0C0C0"
  }
];

export const UserTypeSelectionDialog = ({ open, onSelect }: UserTypeSelectionDialogProps) => {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  const handleConfirm = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Your User Type</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          {userTypes.map((userType) => (
            <Button
              key={userType.type}
              variant={selectedType === userType.type ? "default" : "outline"}
              className="flex flex-col items-start p-4 h-auto"
              onClick={() => setSelectedType(userType.type)}
              style={{ 
                borderColor: userType.color,
                backgroundColor: selectedType === userType.type ? userType.color : undefined,
                color: selectedType === userType.type ? "white" : undefined
              }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ 
                    backgroundColor: selectedType === userType.type ? "white" : userType.color,
                    border: selectedType === userType.type ? "none" : `1px solid ${userType.color}`
                  }}
                />
                <span className="font-semibold">{userType.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{userType.description}</p>
            </Button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={handleConfirm}
            disabled={!selectedType}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 