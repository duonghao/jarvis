'use client';

import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  RotateCw,
  SearchIcon,
} from 'lucide-react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { useResizeDetector } from 'react-resize-detector';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useToast } from './ui/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import SimpleBar from 'simplebar-react';
import PDFFullScreen from './PDFFullScreen';

interface PDFRendererProps {
  url: string;
}

export default function PDFRenderer({ url }: PDFRendererProps) {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();
  const [currPageNum, setCurrPageNum] = useState<number>(1);
  const [maxPageNum, setMaxPageNum] = useState<number>();
  const [scale, setScale] = useState<number>(1);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);
  const isLoading = renderedScale !== scale;

  const CustomPageValidator = z.object({
    page: z.string().refine((num) => {
      return Number(num) > 0 && Number(num) <= maxPageNum!;
    }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: '1',
    },
    resolver: zodResolver(CustomPageValidator),
  });

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrPageNum(Number(page));
    setValue('page', page);
  };

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            disabled={currPageNum <= 1}
            variant="ghost"
            aria-label="previous page"
            onClick={() => {
              setCurrPageNum((prev) => {
                let nextPage: number;
                if (prev - 1 > 1) {
                  nextPage = prev - 1;
                } else {
                  nextPage = 1;
                }
                setValue('page', String(nextPage));
                return nextPage;
              });
            }}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              {...register('page')}
              className={cn(
                'w-12 h-8',
                errors.page && 'focus-visible:ring-red-500'
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  console.log('pressedEnter');
                  handleSubmit(handlePageSubmit)();
                  console.log(errors);
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{maxPageNum ?? '*'}</span>
            </p>
          </div>

          <Button
            disabled={maxPageNum === undefined || currPageNum === maxPageNum}
            variant="ghost"
            aria-label="next page"
            onClick={() => {
              setCurrPageNum((prev) => {
                let nextPage: number;
                if (prev + 1 > maxPageNum!) {
                  nextPage = maxPageNum!;
                } else {
                  nextPage = prev + 1;
                }
                setValue('page', String(nextPage));
                return nextPage;
              });
            }}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1.5">
                <SearchIcon className="h-4 w-4" aria-label="zoom"></SearchIcon>
                {scale * 100}%
                <ChevronDown className="w-3 h-3 opacity-50"></ChevronDown>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" aria-label="rotate 90 degrees clockwise">
            <RotateCw
              className="h-4 w-4"
              onClick={() => {
                setRotationAngle((prev) => prev + 90);
              }}
            />
          </Button>
          <Button variant="ghost" aria-label="rotate 90 degrees anti-clockwise">
            <RotateCcw
              className="h-4 w-4"
              onClick={() => {
                setRotationAngle((prev) => prev - 90);
              }}
            />
          </Button>
          <PDFFullScreen url={url} />
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
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
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={currPageNum}
                  scale={scale}
                  rotate={rotationAngle}
                  key={'@' + renderedScale}
                />
              ) : null}

              <Page
                className={cn(isLoading ? 'hidden' : '')}
                width={width ? width : 1}
                pageNumber={currPageNum}
                scale={scale}
                rotate={rotationAngle}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin"></Loader2>
                  </div>
                }
                key={'@' + scale}
                onRenderSuccess={() => setRenderedScale(scale)}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
}
