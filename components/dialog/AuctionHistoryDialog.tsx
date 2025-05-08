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
                  <TableHead className="w-[80px]">Round</TableHead>
                  <TableHead className="w-[200px]">Winner</TableHead>
                  <TableHead className="w-[120px]">Final Price</TableHead>
                  <TableHead className="w-[100px]">Total Bids</TableHead>
                  <TableHead className="w-[120px]">Start Price</TableHead>
                  <TableHead>End Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">#{record.round}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {record.winner?.profile?.avatar ? (
                            <AvatarImage src={record.winner.profile.avatar} />
                          ) : (
                            <AvatarFallback>
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="truncate">{record.winner?.profile?.name || record.winner?.walletAddress || 'No winner'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span>{record.finalPrice || 0} SUI</span>
                      </div>
                    </TableCell>
                    <TableCell>{record.totalBids}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-muted-foreground" />
                        <span>{record.startPrice} SUI</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {record.biddingDueDate && !isNaN(new Date(record.biddingDueDate).getTime()) 
                            ? formatDistanceToNow(new Date(record.biddingDueDate), { addSuffix: true })
                            : 'N/A'
                          }
                        </span>
                      </div>
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