import { useAuctionHistory } from '@/lib/api/hooks';
import { formatDistanceToNow } from 'date-fns';
import { Trophy, Coins, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface AuctionHistoryDialogProps {
  postId: string;
  trigger?: React.ReactNode;
}

export function AuctionHistoryDialog({ postId, trigger }: AuctionHistoryDialogProps) {
  const { data: historyData, isLoading } = useAuctionHistory(postId);

  return (
    <Dialog>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Auction History
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : historyData?.history && historyData.history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Winner</TableHead>
                  <TableHead>Final Price</TableHead>
                  <TableHead>Total Bids</TableHead>
                  <TableHead>Start Price</TableHead>
                  <TableHead>End Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          {record.winner.profile?.avatar ? (
                            <AvatarImage src={record.winner.profile.avatar} />
                          ) : (
                            <AvatarFallback>
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span>{record.winner.profile?.name || record.winner.walletAddress}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      {record.finalPrice} SUI
                    </TableCell>
                    <TableCell>{record.totalBids}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-muted-foreground" />
                      {record.startPrice} SUI
                    </TableCell>
                    <TableCell className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(record.biddingDueDate), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No auction history yet
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 