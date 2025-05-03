import { useUpdateUser } from "@/lib/api/hooks";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { toast } from "sonner";
import { FlowDialog, Step } from "./FlowDialog";
import { UserType } from "@/lib/api/types";

interface UserTypeDialogProps {
  open: boolean;
  onClose: () => void;
  selectedType: UserType;
}

export const UserTypeDialog = ({ open, onClose, selectedType }: UserTypeDialogProps) => {
  const account = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { mutate: updateUser } = useUpdateUser();

  const steps = [
    {
      title: "Call Contract",
      description: "Calling contract to update user type...",
      action: async () => {
        // Here should call contract for signature verification
        // Now just mock the process、
        if (!account?.address) {
          throw new Error("No wallet connected");
        }
        const message = `Select user type: ${selectedType}`;
        const { signature } = await signPersonalMessage({
          message: new TextEncoder().encode(message),
        });
        return { address: account.address, signature, userType: selectedType };
      },
    },
    {
      title: "Update Profile",
      description: "Updating your profile...",
      action: async ({ address, signature, userType }: { address: string; signature: string; userType: UserType }) => {
        return new Promise((resolve, reject) => {
          updateUser({ userType }, {
            onSuccess: () => {
              resolve({ address, signature, userType });
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