import { Spinner } from "@heroui/react";

const Loading = () => {
    return ( <>
    
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <Spinner size="lg" color="accent" />
    </div>
    </> );
}
 
export default Loading;