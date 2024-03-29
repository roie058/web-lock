import React from 'react'

type Props = {
    page:"home"|"list"|"about",
    setPage:React.Dispatch<"home"|"list"|"about">
}

const Nav = (props: Props) => {

    const onClickHandler = (page:"home"|"list"|"about") =>{
       props.setPage(page)
    }

  return (
    <nav>
        <h2>Weblock</h2>
        <ul className='navigation'>
            <li className={props.page=="home"?"navActive":""} onClick={()=>onClickHandler("home")} >Home</li>
            <li className={props.page=="list"?"navActive":""} onClick={()=>onClickHandler("list")}>blocked list</li>
            <li className={props.page=="about"?"navActive":""} onClick={()=>onClickHandler("about")}>About</li>

        </ul>
        </nav>
  )
}

export default Nav