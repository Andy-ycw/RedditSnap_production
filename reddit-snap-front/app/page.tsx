import LineChart from '@/app/ui/LineChart'
import { fetchData } from './actions/dev_utility';
import SearchForm from './ui/Search';


export default async function Page(
  {searchParams,}:
  {
    searchParams?: {
      submission_id?: string;
    }
  }
) {
  const query = searchParams?.submission_id || '1fgua0x' ;
  console.log('query', query)
  const data = await fetchData(query)
  return (
    <> 
      <div className='flex-col justify-items-center mt-64'>
        
        <LineChart data={data}/> 
        
        <div className='flex justify-center'>
        
          <SearchForm/>

        </div>
      </div>
    
    </>
    
  );
}

