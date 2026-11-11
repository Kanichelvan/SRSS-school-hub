import { useLoad, one } from '../data';
import { ErrorNote, Loading, PageHeader } from '../ui';
export function ResultsOpeningGate({children}) {
 const {data,loading,error}=useLoad(()=>one('operationsRelease/current'),[]);
 if(loading)return <Loading/>;if(error)return <ErrorNote error={error}/>;
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur'}).format(new Date());
 if(!data?.resultsOpen||date<'2027-03-01')return <PageHeader kicker="Progressive opening" title="Results & report cards">From when it opens. This area will be available after February 2027 once the School has confirmed readiness and opened it.</PageHeader>;
 return children;
}
