import { useCurrentAccount } from '@mysten/dapp-kit';
import { useIdentity } from '@/hooks/useSphereQueries';
import { useSphereContract } from '@/hooks/useSphereContract';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function IdentityManager() {
  const account = useCurrentAccount();
  const { data: identity, isLoading } = useIdentity(account?.address);
  const { register } = useSphereContract();

  const handleRegister = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const result = await register(account.address, 1); // 1 for user type
      toast.success('Identity registered successfully');
      console.log('Registration result:', result);
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Failed to register identity', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  if (isLoading) {
    return <div>Loading identity...</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Identity Management</h2>
      {identity ? (
        <div>
          <p>Identity Status: Registered</p>
          <p>Address: {account?.address}</p>
        </div>
      ) : (
        <div>
          <p>Identity Status: Not Registered</p>
          <Button onClick={handleRegister} className="mt-2">
            Register Identity
          </Button>
        </div>
      )}
    </div>
  );
} 