
import {
  UseMutationOptions,
  useMutation,
  useQueries, useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import { unionBy } from 'lodash';
import { getDiscussionCollection } from '../../hive/dhive';

import { getAccountPosts } from '../../hive/dhive';
import QUERIES from '../queryKeys';
import { delay } from '../../../utils/editor';
import { injectPostCache, injectVoteCache, mapDiscussionToThreads } from '../../../utils/postParser';
import { useAppSelector } from '../../../hooks';



export const useWavesQuery = (host: string) => {

  const queryClient = useQueryClient();

  const cachedComments = useAppSelector(state => state.cache.commentsCollection);
  const cachedVotes = useAppSelector(state => state.cache.votesCollection);
  const lastCacheUpdate = useAppSelector(state => state.cache.lastUpdate);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activePermlinks, setActivePermlinks] = useState<string[]>([]);
  const [permlinksBucket, setPermlinksBucket] = useState<string[]>([]);

  const wavesIndexCollection = useRef<{ [key: string]: string }>({});




  // query initialization
  const wavesQueries = useQueries({
    queries: activePermlinks.map((pagePermlink, index) => ({
      queryKey: [QUERIES.WAVES.GET, host, index],
      queryFn: () => _fetchWaves(pagePermlink),
      initialData: [],
    })),
  });




  useEffect(() => {
    _fetchPermlinks()
  }, [])


  useEffect(() => {
    if (!!permlinksBucket.length) {
      activePermlinks.push(permlinksBucket[activePermlinks.length]);
      setActivePermlinks([...activePermlinks]);
    }
  }, [permlinksBucket])


  useEffect(() => {
    //check cache is recently updated and take post path 
    if (lastCacheUpdate) {
      const _timeElapsed = new Date().getTime() - lastCacheUpdate.updateAt
      if (lastCacheUpdate.type === 'vote' && _timeElapsed < 5000) {
        //using post path get index of query key where that post exists
        const _path = lastCacheUpdate.postPath;
        const _containerPermlink = wavesIndexCollection.current[_path];
        const _containerIndex = activePermlinks.indexOf[_containerPermlink]
        if (_containerIndex >= 0) {
          //mean data exist, get query data, update query data by finding post and injecting cache
          const _qData: any[] | undefined = wavesQueries[_containerIndex].data;
          if (_qData) {
            const _postIndex = _qData.findIndex((item) => lastCacheUpdate.postPath === `${item.author}/${item.permlink}`);
            const _post = _qData[_postIndex];
            if (_post) {
              const _cPost = injectVoteCache(_post, cachedVotes);

              //set query data
              _qData.splice(_postIndex, 1, _cPost);
              queryClient.setQueryData([QUERIES.WAVES.GET, host, _containerIndex], [..._qData]);
            }
          }
        }
      }
    }

  }, [lastCacheUpdate])



  const _fetchPermlinks = async (startPermlink = '', refresh = false) => {
    setIsLoading(true);
    try {
      const query: any = {
        account: host,
        start_author: !!startPermlink ? host : '',
        start_permlink: startPermlink,
        limit: 10,
        observer: '',
        sort: 'posts',
      };

      const result = await getAccountPosts(query);

      const _fetchedPermlinks = result.map(post => post.permlink);
      console.log('permlinks fetched', _fetchedPermlinks);

      const _permlinksBucket = refresh ? _fetchedPermlinks : [...permlinksBucket, ..._fetchedPermlinks];
      setPermlinksBucket(_permlinksBucket);

      if (refresh) {
        //precautionary delay of 200ms to let state update before concluding promise,
        //it is effective for waves refresh routine.
        await delay(200)
      }
    } catch (err) {
      console.warn("failed to fetch waves permlinks");
    }

    setIsLoading(false)
  }

  const _fetchWaves = async (pagePermlink: string) => {
    console.log('fetching waves from:', host, pagePermlink);
    const response = await getDiscussionCollection(host, pagePermlink);

    //TODO: inject comment cache here...
    const _cResponse = injectPostCache(response, cachedComments, cachedVotes, lastCacheUpdate);
    const _threadedComments = await mapDiscussionToThreads(_cResponse, host, pagePermlink, 1);

    if (!_threadedComments) {
      throw new Error("Failed to parse waves");
    }

    _threadedComments.sort((a, b) => new Date(a.created) > new Date(b.created) ? -1 : 1);
    _threadedComments.forEach((item) => {
      wavesIndexCollection.current[`${item.author}/${item.permlink}`] = pagePermlink
    })
    console.log('new waves fetched', _threadedComments);
    return _threadedComments || {};
  };


  const _refresh = async () => {
    setIsRefreshing(true);
    setPermlinksBucket([]);
    setActivePermlinks([]);
    await _fetchPermlinks('', true);
    await wavesQueries[0].refetch();
    setIsRefreshing(false);
  };

  const _fetchNextPage = () => {
    const lastPage = wavesQueries.lastItem;

    if (!lastPage || lastPage.isFetching) {
      return;
    }

    const _nextPagePermlink = permlinksBucket[activePermlinks.length];

    //TODO: find a way to proactively refill active permlinks here.

    if (_nextPagePermlink && !activePermlinks.includes(_nextPagePermlink)) {
      activePermlinks.push(_nextPagePermlink);
      setActivePermlinks([...activePermlinks]);
    } else {
      _fetchPermlinks(permlinksBucket.lastItem)
    }
  };

  const _dataArrs = wavesQueries.map((query) => query.data);

  return {
    data: unionBy(..._dataArrs, 'url'),
    isRefreshing,
    isLoading: isLoading || wavesQueries.lastItem?.isLoading || wavesQueries.lastItem?.isFetching,
    fetchNextPage: _fetchNextPage,
    refresh: _refresh,
  };
};


export const fetchLatestWavesContainer = async (host) => {
  const query: any = {
    account: host,
    start_author: '',
    start_permlink: '',
    limit: 1,
    observer: '',
    sort: 'posts',
  };

  const result = await getAccountPosts(query);

  const _latestPost = result[0];
  console.log('lates waves post', host, _latestPost);

  if (!_latestPost) {
    throw new Error("Lates waves container could be not fetched");
  }

  return _latestPost;
}




export const usePublishWaveMutation = () => {

  const queryClient = useQueryClient();

  // const cachedComments = useAppSelector(state => state.cache.commentsCollection);

  // id is options, if no id is provided program marks all notifications as read;
  const _mutationFn = async (cachePostData: any) => {
    //TODO: lates port wave publishing here or introduce post publishing mutation;
    if (cachePostData) { //TODO: expand to check multiple wave hosts;{
      const _host = cachePostData.parent_author;

      console.log('returning waves host', _host);
      return _host;
    }

    throw new Error("invalid mutations data")

  };

  const _options: UseMutationOptions<string, unknown, any, void> = {
    onMutate: async (cacheCommentData: any) => {
      // TODO: find a way to optimise mutations by avoiding too many loops
      console.log('on mutate data', cacheCommentData);

      const _host = cacheCommentData.parent_author;

      // update query data
      const _queryKey = [QUERIES.WAVES.GET, _host, 0];
      const queryData: any[] | undefined = queryClient.getQueryData(_queryKey);

      console.log('query data', queryData);

      if (queryData && cacheCommentData) {
        queryData.splice(0, 0, cacheCommentData);
        queryClient.setQueryData(_queryKey, queryData);
      }

    },

    onSuccess: async (host) => {
      await delay(5000);
      queryClient.invalidateQueries([QUERIES.WAVES.GET, host, 0]);
    },
  };

  return useMutation(_mutationFn, _options);
};
