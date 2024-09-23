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
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                <div className="md:hidden">
                    { result_rows?.map((result_row) => (
                        <div key={result_row.title}>
                            {result_row.title}
                        </div>
                        

                    ))}
                    
                </div>
                
            </div>
            </div>
        </div>
    );
}
