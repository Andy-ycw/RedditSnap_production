import { fetchFuzzyTitle } from "../lib/data";

export default async function SubmissionTable({
  query,
//   currentPage,
}: {
  query?: string;

}) {
    if (!query) return 

    const result_rows = await fetchFuzzyTitle(query);

    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="bg-gray-50 p-2 md:pt-0">
                    
                        { result_rows?.map((result_row) => (
                            // <div key={result_row.id}>
                            //     <Link 
                            //         href={`/RedditSnap?submission_id=${result_row.id}`}
                            //         className="rounded-md border p-2 hover:bg-gray-100"
                            //     >
                            //         {result_row.id} | {result_row.title}
                            //     </Link>
                            // </div>

                            <div key={result_row.id} >
                                <p className="hover:text-blue-500 hover:cursor-pointer">
                                    <a href={`/RedditSnap?submission_id=${result_row.id}`}>{result_row.id} | {result_row.title} </a>    
                                </p>
                            </div>
                            

                        ))}
                        
                    
                    
                </div>
            </div>
        </div>
    );
}
