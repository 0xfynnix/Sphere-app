import { useUpdateUser } from "@/lib/api/hooks";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { toast } from "sonner";
import { FlowDialog, Step } from "./FlowDialog";
import { UserType } from "@/lib/api/types";
import { useSphereContract } from '@/hooks/useSphereContract';

interface UserTypeDialogProps {
  open: boolean;
  onClose: () => void;
  selectedType: UserType;
}

export const UserTypeDialog = ({ open, onClose, selectedType }: UserTypeDialogProps) => {
  const account = useCurrentAccount();
  const { mutate: updateUser } = useUpdateUser();
  const { register } = useSphereContract();

  const steps = [
    {
      title: "Call Contract",
      description: "Calling contract to update user type...",
      action: async () => {
        if (!account?.address) {
          throw new Error("No wallet connected");
        }
        
        // Convert selected type to number based on the identity.move types
        const typeMap: Record<string, number> = {
          [UserType.ARTIST]: 1,
          [UserType.GEEK]: 2,
          [UserType.STORYTELLER]: 3,
          [UserType.MEME_LORD]: 4,
          [UserType.EXPLORER]: 5
        };
        
        const typeNumber = typeMap[selectedType];
        if (!typeNumber) {
          throw new Error("Invalid user type");
        }

        const result = await register(typeNumber);
        console.log(result);  
        return { 
          address: account.address, 
          userType: selectedType,
          txDigest: result.digest 
        };
      },
    },
    {
      title: "Update Profile",
      description: "Updating your profile...",
      action: async ({ address, userType, txDigest }: { address: string; userType: UserType; txDigest: string }) => {
        return new Promise((resolve, reject) => {
          updateUser({ userType, txDigest }, {
            onSuccess: () => {
              resolve({ address, userType, txDigest });
            },
            onError: (error) => {
              reject(error);
            },
          });
        });
      },
    },
  ];

  return (
    <FlowDialog
      open={open}
      onClose={() => {}}
      steps={steps as Step<unknown>[]}
      onSuccess={() => {
        toast.success("User type updated successfully");
        onClose();
      }}
      onError={(error) => {
        console.error("Operation failed:", error);
        toast.error("Operation failed", { description: error.message });
      }}
    />
  );
}; 