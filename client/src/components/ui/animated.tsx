import { motion, MotionProps, AnimatePresence, HTMLMotionProps } from "framer-motion";
import React, { PropsWithChildren, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  pageVariants,
  containerVariants,
  itemVariants,
  cardHoverVariants,
  modalVariants,
  buttonVariants,
  rtlPageVariants,
  rtlListItemVariants,
  rtlSidebarItemVariants,
  scrollAnimationVariants,
  carouselItemVariants
} from "@/lib/motion";

// Animated page wrapper
interface AnimatedPageProps extends HTMLMotionProps<"div"> {
  className?: string;
  rtl?: boolean;
  children?: React.ReactNode;
}

export function AnimatedPage({ 
  children, 
  className, 
  rtl = true, // Default to RTL since the app primarily targets Arabic users
  ...props 
}: AnimatedPageProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={rtl ? rtlPageVariants : pageVariants}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated container with staggered children
export function AnimatedContainer({ 
  children, 
  className, 
  ...props 
}: { children?: React.ReactNode, className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={containerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated item for lists
interface AnimatedItemProps extends HTMLMotionProps<"div"> {
  className?: string;
  rtl?: boolean;
  index?: number;
  children?: React.ReactNode;
}

export function AnimatedItem({ 
  children, 
  className, 
  rtl = true, 
  index, 
  ...props 
}: AnimatedItemProps) {
  return (
    <motion.div
      variants={rtl ? rtlListItemVariants : itemVariants}
      custom={index}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated card with hover effects
interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function AnimatedCard({ 
  children, 
  className, 
  onClick,
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={cardHoverVariants}
      className={cn("cursor-pointer", className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated modal/dialog
interface AnimatedModalProps extends HTMLMotionProps<"div"> {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  overlay?: boolean;
  children?: React.ReactNode;
}

export function AnimatedModal({ 
  children, 
  className, 
  isOpen, 
  onClose,
  overlay = true,
  ...props 
}: AnimatedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {overlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
          )}
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={modalVariants}
            className={cn("fixed z-50", className)}
            {...props}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Animated button with effects
interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function AnimatedButton({ 
  children, 
  className, 
  onClick,
  disabled,
  ...props 
}: AnimatedButtonProps) {
  return (
    <motion.button
      initial="initial"
      whileHover={disabled ? "" : "hover"}
      whileTap={disabled ? "" : "tap"}
      variants={buttonVariants}
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Animated image with loading fade effect
interface AnimatedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  containerClassName?: string;
}

export function AnimatedImage({ 
  src, 
  alt, 
  className, 
  containerClassName,
  ...props 
}: AnimatedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn("overflow-hidden relative", containerClassName)}>
      <div className="relative w-full h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <img
            src={src}
            alt={alt || ""}
            className={className}
            onLoad={() => setIsLoaded(true)}
            {...props}
          />
        </motion.div>
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
      </div>
    </div>
  );
}

// Animated scroll view
interface AnimatedScrollViewProps extends PropsWithChildren {
  className?: string;
  threshold?: number;
  staggerChildren?: boolean;
}

export function AnimatedScrollView({ 
  children, 
  className,
  threshold = 0.1,
  staggerChildren = false
}: AnimatedScrollViewProps) {
  return (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: threshold }}
      variants={staggerChildren ? containerVariants : undefined}
      className={className}
    >
      {staggerChildren ? children : (
        <motion.div variants={scrollAnimationVariants}>
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

// Animated carousel
interface AnimatedCarouselProps {
  items: React.ReactNode[];
  className?: string;
  interval?: number; // Auto-advance interval in ms, 0 to disable
  withIndicators?: boolean;
}

export function AnimatedCarousel({
  items,
  className,
  interval = 5000,
  withIndicators = true
}: AnimatedCarouselProps) {
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);
  
  const handleNext = () => {
    setCurrentIndex(prev => [
      prev[0] === items.length - 1 ? 0 : prev[0] + 1,
      1
    ]);
  };
  
  const handlePrev = () => {
    setCurrentIndex(prev => [
      prev[0] === 0 ? items.length - 1 : prev[0] - 1,
      -1
    ]);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(prev => [
      index,
      index > prev[0] ? 1 : -1
    ]);
  };
  
  useEffect(() => {
    if (interval <= 0) return;
    
    const timer = setInterval(() => {
      handleNext();
    }, interval);
    
    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={carouselItemVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="w-full"
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
      
      <motion.button
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 p-2 rounded-full"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handlePrev}
      >
        ←
      </motion.button>
      
      <motion.button
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 p-2 rounded-full"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleNext}
      >
        →
      </motion.button>
      
      {withIndicators && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {items.map((_, index) => (
            <motion.button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full",
                index === currentIndex ? "bg-primary" : "bg-muted"
              )}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Animated sidebar item
interface AnimatedSidebarItemProps extends HTMLMotionProps<"div"> {
  className?: string;
  rtl?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function AnimatedSidebarItem({
  children,
  className,
  rtl = true,
  isActive,
  onClick,
  ...props
}: AnimatedSidebarItemProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      variants={rtl ? rtlSidebarItemVariants : rtlSidebarItemVariants}
      className={cn(
        "cursor-pointer",
        isActive && "font-bold bg-sidebar-accent/10",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Text reveal animation (letter by letter)
interface AnimatedTextProps {
  text: string;
  className?: string;
  staggerChildren?: number;
}

export function AnimatedText({
  text,
  className,
  staggerChildren = 0.02
}: AnimatedTextProps) {
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: staggerChildren, delayChildren: 0.04 * i },
    }),
  };
  
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className={cn("flex flex-wrap", className)}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <span key={index} className="mr-1 whitespace-nowrap">
          {Array.from(word).map((char, charIndex) => (
            <motion.span
              key={charIndex}
              variants={child}
              style={{ display: "inline-block" }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.div>
  );
}

// Entry animation for lists
export function FadeInStaggerContainer({
  children,
  className,
  ...props
}: { children?: React.ReactNode, className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={containerVariants}
      className={className}
      {...props}
    >
      <AnimatePresence>
        {React.Children.map(children, (child, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}