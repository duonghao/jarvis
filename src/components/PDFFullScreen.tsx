import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Expand, Loader2 } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import { Document, Page } from 'react-pdf';
import { useToast } from './ui/use-toast';
import { useResizeDetector } from 'react-resize-detector';

interface PDFFullScreenProps {
  url: string;
}

export default function PDFFullScreen({ url }: PDFFullScreenProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const [maxPageNum, setMaxPageNum] = useState<number>();
  const { width, ref } = useResizeDetector();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger
        asChild
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <Button variant="ghost" aria-label="fullscreen">
          <Expand className="h-4 w-4"></Expand>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
          <div ref={ref}>
            <Document
              onLoadSuccess={({ numPages }) => {
                setMaxPageNum(numPages);
              }}
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: 'Error loading PDF',
                  description: 'Please try again later',
                  variant: 'destructive',
                });
              }}
              file={url}
              className="max-h-full"
            >
              {new Array(maxPageNum).fill(0).map((_, i) => {
                return <Page key={i} pageNumber={i + 1} width={width ?? 1} />;
              })}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
}
