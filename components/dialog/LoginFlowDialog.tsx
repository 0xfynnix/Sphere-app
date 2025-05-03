import { useWalletLogin } from "@/lib/api/hooks";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { toast } from "sonner";
import { FlowDialog, Step } from "./FlowDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { UserProfile } from "@/lib/api/types";

interface LoginFlowDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (result: { success: boolean, token: string, user: UserProfile }) => void;
}

export const LoginFlowDialog = ({ open, onClose, onSuccess }: LoginFlowDialogProps) => {
  const { getChallenge, verifySignature } = useWalletLogin();
  const account = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const queryClient = useQueryClient();
  const { setToken, setUser } = useUserStore();

  const steps = [
    {
      title: "Sign Message",
      description: "Please confirm the signature operation in your wallet",
      action: async () => {
        if (!account?.address) {
          throw new Error("No wallet connected");
        }
        const {
          data: { challenge },
        } = await getChallenge.mutateAsync(account.address);
        const { signature } = await signPersonalMessage({
          message: new TextEncoder().encode(challenge),
        });
        return { address: account.address, challenge, signature };
      },
    },
    {
      title: "Verify Signature",
      description: "Verifying signature and getting user information...",
      action: async ({
        address,
        challenge,
        signature,
      }: {
        address: string;
        challenge: string;
        signature: string;
      }) => {
        const {
          data: { token, user },
        } = await verifySignature.mutateAsync({
          walletAddress: address,
          signature,
          challenge,
        });
        // 保存 token 和用户信息
        setToken(token);
        setUser(user);

        // 使相关查询失效，触发重新获取
        await queryClient.invalidateQueries({ queryKey: ["user"] });

        return { success: true, token, user };
      },
    },
  ];

  return (
    <FlowDialog
      open={open}
      onClose={onClose}
      steps={steps as Step<unknown>[]}
      onSuccess={(result) => {
        if ((result as { success: boolean }).success) {
          onSuccess(result as { success: boolean, token: string, user: UserProfile });
          toast.success("Login successful");
        } else {
          toast.error("Login failed");
        }
      }}
      onError={(error) => {
        console.error("Login failed:", error);
        toast.error("Login failed", { description: error.message });
      }}
    />
  );
};
 