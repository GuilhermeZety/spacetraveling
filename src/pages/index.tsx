import { GetStaticProps } from 'next';
import Head from "next/head"
import Link from 'next/link'

import Prismic from '@prismicio/client'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { FiUser, FiCalendar } from "react-icons/fi";
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props: HomeProps) {

  console.log("props")
  console.log(props.postsPagination.results)
  console.log("props")

  const posts = props.postsPagination.results;
  
  return (
    <>
      <Head>
        <title>Home | SpaceTreveling</title>
      </Head>
      
      <main className={styles.container}>
       
        <Header />
      
        <section className={styles.posts}>

          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                
                <div className={styles.teste}>
                  <span><FiCalendar />{post.first_publication_date}</span>
                  <span><FiUser />{post.data.author}</span>
                </div>    
              </a>
            </Link>
          ))}
          
        </section>     

          <div className={styles.load_more}>
            <button>Carregar mais posts</button>
          </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
 
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
      ], 
        {
          fetch: ['publication.title', 'publication.content'],
          pageSize: 100,
        }
      )
    var resultados = [] as Post[];

    postsResponse.results.map(e => {
      resultados.push({
        uid: e.uid,
        first_publication_date: new Date(e.first_publication_date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',    
        }),
        data: {
          title: e.data.title,
          subtitle: e.data.subtitle,
          author: e.data.author,
        },
      })
    })

    const postsPagination: PostPagination = {
      next_page: postsResponse.next_page,
      results: resultados
    };

    return {
      props: {
        postsPagination
      }
  }
};
