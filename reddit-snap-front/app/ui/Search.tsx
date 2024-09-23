'use client'
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';


export function SearchIdForm() {
    
    return (
        <div>
            <form id="myForm">
                <label htmlFor="search"></label>
                <input type="text" name="submission_id" placeholder="Search by post id..." />
                <button className="rounded-lg bg-blue-600 px-4 ml-4" type="submit">Submit</button>
            </form>
        </div>
    );
}

export function SearchTitleForm() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => { 
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (term) {
        params.set('title', term);
        } else {
        params.delete('title');
        }
        console.log(`${pathname}?${params.toString()}`);
        replace(`${pathname}?${params.toString()}`);
        
    }, 300);

    return (
        <div>
            
            <label htmlFor="search"></label>
            <input 
                type="text" name="submission_title" placeholder="Search by title..." 
                onChange={(e) => {
                    handleSearch(e.target.value);
                  }}    
            />
            
        </div>
    );
}